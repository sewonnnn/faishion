import React from 'react';
import { Button, Form } from 'react-bootstrap';

// props로 postcode와 baseAddress를 받음
const PostcodeSearch = ({ postcode, baseAddress, onAddressSelect }) => {

    console.log(postcode);
    console.log(baseAddress);
    console.log(onAddressSelect);

    const openPostcode = () => {

        new window.daum.Postcode({
            oncomplete: function(data) {
                let fullAddress = data.address;
                let extraAddress = '';

                if (data.addressType === 'R') {
                    if (data.bname !== '') {
                        extraAddress += data.bname;
                    }
                    if (data.buildingName !== '') {
                        extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
                    }
                    fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
                }

                if (onAddressSelect) {
                    const addressData = {
                        zipcode: data.zonecode,
                        street: fullAddress,
                    };
                    onAddressSelect(addressData);
                }
            }
        }).open();
    };

    return (
        <div>
            {/* 우편번호 입력 필드 */}
            <Form.Group className="mb-3">
                <Form.Label>우편번호</Form.Label>
                <div className="input-group">
                    <Form.Control type="text" value={postcode} readOnly />
                    <Button variant="outline-secondary" onClick={openPostcode}>
                        우편번호 찾기
                    </Button>
                </div>
            </Form.Group>

            {/* 주소 입력 필드 */}
            <Form.Group className="mb-3">
                <Form.Label>기본 주소</Form.Label>
                {/* props로 받은 baseAddress 값 사용 */}
                <Form.Control type="text" value={baseAddress} readOnly />
            </Form.Group>
        </div>
    );
};

export default PostcodeSearch;