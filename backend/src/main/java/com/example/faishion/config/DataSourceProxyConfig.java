package com.example.faishion.config;

import com.zaxxer.hikari.HikariDataSource;
import net.ttddyy.dsproxy.listener.logging.SLF4JLogLevel;
import net.ttddyy.dsproxy.support.ProxyDataSourceBuilder;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

@Configuration
public class DataSourceProxyConfig {

    @Bean
    public DataSource originalDataSource(DataSourceProperties properties) {
        return properties.initializeDataSourceBuilder()
                .type(HikariDataSource.class)
                .build();
    }

    @Bean
    @Primary
    public DataSource proxyDataSource(DataSourceProperties properties) {
        DataSource original = originalDataSource(properties);
        return ProxyDataSourceBuilder
                .create(original)
                .name("faishion-datasource")
                .logQueryBySlf4j(SLF4JLogLevel.INFO, "SQL_LOG")
                .countQuery()
                .build();
    }
}
