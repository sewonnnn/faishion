package com.example.faishion.product;

import com.example.faishion.image.Image;
import com.example.faishion.image.ImageService;
import com.example.faishion.seller.SellerRepository;
import com.example.faishion.stock.Stock;
import com.example.faishion.stock.StockRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final SellerRepository sellerRepository;
    private final StockRepository stockRepository;
    private final ImageService imageService;

    public Page<Product> sellerProducts(String sellerId, Pageable pageable) {
        return productRepository.sellerProducts(pageable);
    }

    // 상품목록 전체 불러오기 ho
    public Page<Object[]> findProductsBySearch(String searchQuery, Long categoryId, Pageable pageable) {
       return productRepository.findProductsBySearch(searchQuery, categoryId, pageable);
    }

    // 아이디에 맞는 상품 불러오기 ho
    public Product findById(long id) {
        return productRepository.findById(id);
    }

    @Transactional
    public void createProduct(String sellerId,
                              Product product,
                              List<MultipartFile> mainImages,
                              List<MultipartFile> detailImages,
                              List<Stock> stockList,
                              List<MultipartFile> stockImages) throws IOException {
        product.setSeller(sellerRepository.getReferenceById(sellerId));
        // 1. 상품(Product) 정보 저장
        Product savedProduct = productRepository.save(product);
        // 2. 메인, 상세 이미지 처리 및 저장
        // Product 엔티티의 이미지 리스트 필드를 사용하여 관계를 설정합니다.
        for (MultipartFile file : mainImages) {
            Image image = imageService.saveImage(file);
            savedProduct.getMainImageList().add(image);
        }
        for (MultipartFile file : detailImages) {
            Image image = imageService.saveImage(file);
            savedProduct.getDetailImageList().add(image);
        }
        for (int i = 0; i < stockList.size(); i++) {
            Stock stock = stockList.get(i);
            MultipartFile stockImageFile = stockImages.get(i);
            // 이미지 저장 및 Image 엔티티 생성
            Image savedImage = imageService.saveImage(stockImageFile);
            // Stock 엔티티에 Product와 Image 연결
            stock.setProduct(savedProduct);
            stock.setImage(savedImage);
            // Stock 엔티티 저장
            stockRepository.save(stock);
        }
        // savedProduct의 이미지 리스트에 추가한 후, 저장합니다.
        productRepository.save(savedProduct);
    }

    @Transactional
    public void updateProduct(String sellerId,
                              Product updatedProduct,
                              List<ProductImageInfoDTO> mainInfos,
                              List<MultipartFile> mainImages,
                              List<ProductImageInfoDTO> detailInfos,
                              List<MultipartFile> detailImages,
                              List<Stock> stocks,
                              List<ProductImageInfoDTO> stockInfos,
                              List<MultipartFile> stockImages,
                              List<Long> deletedMainImageIds,
                              List<Long> deletedDetailImageIds,
                              List<Long> deletedStockIds) throws IOException {
        Product existingProduct = productRepository.findById(updatedProduct.getId()).orElseThrow();
        if (!existingProduct.getSeller().getId().equals(sellerId)) {
            throw new AccessDeniedException("상품을 수정할 권한이 없습니다.");
        }
        existingProduct.setName(updatedProduct.getName());
        existingProduct.setDescription(updatedProduct.getDescription());
        existingProduct.setPrice(updatedProduct.getPrice());
        existingProduct.setStatus(updatedProduct.getStatus());
        existingProduct.setDiscountPrice(updatedProduct.getDiscountPrice());
        existingProduct.setDiscountStartDate(updatedProduct.getDiscountStartDate());
        existingProduct.setDiscountEndDate(updatedProduct.getDiscountEndDate());
        existingProduct.setCategory(updatedProduct.getCategory());
        if (deletedMainImageIds != null && !deletedMainImageIds.isEmpty()) {
            List<Image> imagesToRemove = existingProduct.getMainImageList().stream()
                    .filter(image -> deletedMainImageIds.contains(image.getId()))
                    .toList();
            for (Image image : imagesToRemove) {
                imageService.deleteImage(image.getId());
                existingProduct.getMainImageList().remove(image);
            }
        }
        if (deletedDetailImageIds != null && !deletedDetailImageIds.isEmpty()) {
            List<Image> imagesToRemove = existingProduct.getDetailImageList().stream()
                    .filter(image -> deletedDetailImageIds.contains(image.getId()))
                    .toList();
            for (Image image : imagesToRemove) {
                imageService.deleteImage(image.getId());
                existingProduct.getDetailImageList().remove(image);
            }
        }
        if(mainInfos != null) {
            for (ProductImageInfoDTO imageInfo : mainInfos) {
                MultipartFile file = mainImages.get(imageInfo.getImageFileIdx());
                if (imageInfo.getImageId() != null) {
                    imageService.updateImage(imageInfo.getImageId(), file);
                } else {
                    existingProduct.getMainImageList().add(imageService.saveImage(file));
                }
            }
        }
        if(detailInfos != null) {
            for (ProductImageInfoDTO imageInfo : detailInfos) {
                MultipartFile file = detailImages.get(imageInfo.getImageFileIdx());
                if (imageInfo.getImageId() != null) {
                    imageService.updateImage(imageInfo.getImageId(), file);
                } else {
                    existingProduct.getDetailImageList().add(imageService.saveImage(file));
                }
            }
        }
        //재고 삭제 로직(근데 이 재고를 주문한 사용자가 있다면?)
        if (deletedStockIds != null && !deletedStockIds.isEmpty()) {
            List<Stock> stocksToRemove = existingProduct.getStockList().stream()
                    .filter(stock -> deletedStockIds.contains(stock.getId()))
                    .toList();
            for (Stock stock : stocksToRemove) {
                if (stock.getImage() != null) {
                    imageService.deleteImage(stock.getImage().getId());
                }
                existingProduct.getStockList().remove(stock);
            }
        }

        if (deletedStockIds != null && !deletedStockIds.isEmpty()) {
            List<Stock> stocksToRemove = existingProduct.getStockList().stream()
                    .filter(stock -> deletedStockIds.contains(stock.getId()))
                    .toList();
            for (Stock stock : stocksToRemove) {
                // 연관된 이미지 삭제
                if (stock.getImage() != null) {
                    imageService.deleteImage(stock.getImage().getId());
                }
                // Stock 엔티티 삭제
                stockRepository.delete(stock);
                existingProduct.getStockList().remove(stock);
            }
        }

        // 2. 재고 추가 및 수정 처리
        Map<Long, Stock> existingStocksMap = existingProduct.getStockList().stream()
                .collect(Collectors.toMap(Stock::getId, stock -> stock, (oldValue, newValue) -> oldValue, LinkedHashMap::new));

        // 이미지 파일 정보 분류
        Map<Long, Integer> imageIdToFileIdxMap = new LinkedHashMap<>();
        LinkedHashSet<Integer> newStockFileIndices = new LinkedHashSet<>();
        if (stockInfos != null) {
            for (ProductImageInfoDTO info : stockInfos) {
                if (info.getImageId() != null) {
                    // 기존 이미지 수정
                    imageIdToFileIdxMap.put(info.getImageId(), info.getImageFileIdx());
                } else {
                    // 새 Stock 생성 (또는 새 이미지)
                    newStockFileIndices.add(info.getImageFileIdx());
                }
            }
        }

        Integer nextNewStockFileIdx = newStockFileIndices.stream().findFirst().orElse(null);

        for (Stock stockPayload : stocks) {
            Stock stock;
            if (stockPayload.getId() != null) {
                // 기존 Stock 수정
                stock = existingStocksMap.get(stockPayload.getId());
                if (stock == null) continue; // 이미 삭제된 ID

                // 기본 정보 업데이트
                stock.setColor(stockPayload.getColor());
                stock.setSize(stockPayload.getSize());
                stock.setQuantity(stockPayload.getQuantity());

                // 이미지 업데이트 처리
                Long imageId = stock.getImage() != null ? stock.getImage().getId() : null;
                if (imageId != null && imageIdToFileIdxMap.containsKey(imageId)) {
                    Integer fileIdx = imageIdToFileIdxMap.get(imageId);
                    MultipartFile file = stockImages.get(fileIdx);
                    imageService.updateImage(imageId, file);
                    imageIdToFileIdxMap.remove(imageId);
                }
            } else {
                // 새 Stock 생성
                stock = new Stock();
                stock.setProduct(existingProduct);
                stock.setColor(stockPayload.getColor());
                stock.setSize(stockPayload.getSize());
                stock.setQuantity(stockPayload.getQuantity());

                // 새 Stock의 이미지 처리 (nextNewStockFileIdx를 순차적으로 사용)
                if (nextNewStockFileIdx != null) {
                    MultipartFile file = stockImages.get(nextNewStockFileIdx);
                    Image savedImage = imageService.saveImage(file);
                    stock.setImage(savedImage);

                    // 다음 파일 인덱스로 포인터 이동
                    newStockFileIndices.remove(nextNewStockFileIdx);
                    nextNewStockFileIdx = newStockFileIndices.stream().findFirst().orElse(null);
                } else {
                    // Image가 nullable=false 이므로, 이미지가 없으면 Stock 생성 건너뛰기
                    continue;
                }

                stockRepository.save(stock);
                existingProduct.getStockList().add(stock);
            }
        }

        productRepository.save(existingProduct);
    }
}
