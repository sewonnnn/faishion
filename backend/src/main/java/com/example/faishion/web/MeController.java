package com.example.faishion.web;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class MeController {
    @GetMapping("/me")
    public String me(Authentication auth) {
        return "hello " + (auth != null ? auth.getName() : "anonymous");
    }
}
