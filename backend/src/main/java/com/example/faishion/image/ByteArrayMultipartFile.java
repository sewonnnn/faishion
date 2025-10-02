package com.example.faishion.image;

import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;

public class ByteArrayMultipartFile implements MultipartFile {
    private final byte[] bytes;
    private final String name;
    private final String filename;
    private final String contentType;

    public ByteArrayMultipartFile(byte[] bytes, String name, String filename, String contentType) {
        this.bytes = bytes;
        this.name = name;
        this.filename = filename;
        this.contentType = contentType;
    }

    @Override
    public String getName() { return name; }

    @Override
    public String getOriginalFilename() { return filename; }

    @Override
    public String getContentType() { return contentType; }

    @Override
    public boolean isEmpty() { return bytes == null || bytes.length == 0; }

    @Override
    public long getSize() { return bytes.length; }

    @Override
    public byte[] getBytes() throws IOException { return bytes; }

    @Override
    public InputStream getInputStream() throws IOException { return new ByteArrayInputStream(bytes); }

    @Override
    public void transferTo(Path dest) throws IOException, IllegalStateException {
        Files.write(dest, bytes);
    }

    @Override
    public void transferTo(java.io.File dest) throws IOException, IllegalStateException {
        Files.write(dest.toPath(), bytes);
    }
}
