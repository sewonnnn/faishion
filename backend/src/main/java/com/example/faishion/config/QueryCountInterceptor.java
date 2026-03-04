package com.example.faishion.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import net.ttddyy.dsproxy.QueryCount;
import net.ttddyy.dsproxy.QueryCountHolder;
import org.springframework.web.servlet.HandlerInterceptor;

@Slf4j
public class QueryCountInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        QueryCountHolder.clear();
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        QueryCount count = QueryCountHolder.getGrandTotal();
        log.info("[QUERY COUNT] {} {} → total={}, select={}, insert={}, update={}, delete={}",
                request.getMethod(),
                request.getRequestURI(),
                count.getTotal(),
                count.getSelect(),
                count.getInsert(),
                count.getUpdate(),
                count.getDelete()
        );
    }
}
