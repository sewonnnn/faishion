package com.example.faishion.payment;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class WidgetController {

    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    // order 테이블에 저장
    @RequestMapping("/payments")
    public void confirmPayment(@RequestBody String jsonBody) throws Exception {
        System.out.println("결제 성공 후 컨트롤러 값:"+jsonBody);
    }

    @PostMapping("/confirm")
    public void payment(@RequestBody String jsonBody) throws Exception {
        System.out.println("결제 성공 후 컨트롤러 값:"+jsonBody);

    }
}
