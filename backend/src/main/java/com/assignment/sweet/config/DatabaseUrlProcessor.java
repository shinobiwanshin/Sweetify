package com.assignment.sweet.config;

import org.springframework.boot.context.event.ApplicationEnvironmentPreparedEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.lang.NonNull;

import java.util.HashMap;
import java.util.Map;

/**
 * Converts DATABASE_URL (postgres://...) to JDBC format (jdbc:postgresql://...)
 * for Render compatibility.
 * Render provides PostgreSQL URLs in postgres:// format, but Spring JDBC
 * requires jdbc:postgresql://.
 */
public class DatabaseUrlProcessor implements ApplicationListener<ApplicationEnvironmentPreparedEvent> {

    @Override
    public void onApplicationEvent(@NonNull ApplicationEnvironmentPreparedEvent event) {
        ConfigurableEnvironment environment = event.getEnvironment();
        String databaseUrl = environment.getProperty("DATABASE_URL");

        if (databaseUrl != null && !databaseUrl.startsWith("jdbc:")) {
            // Convert postgres://user:pass@host:port/db to jdbc:postgresql://host:port/db
            String jdbcUrl = convertToJdbcUrl(databaseUrl);

            Map<String, Object> props = new HashMap<>();
            props.put("SPRING_DATASOURCE_URL", jdbcUrl);

            // Extract user and password from URL if present
            if (databaseUrl.contains("@")) {
                String credentials = databaseUrl.split("@")[0].replace("postgres://", "").replace("postgresql://", "");
                if (credentials.contains(":")) {
                    String[] parts = credentials.split(":");
                    props.put("SPRING_DATASOURCE_USERNAME", parts[0]);
                    props.put("SPRING_DATASOURCE_PASSWORD", parts[1]);
                }
            }

            environment.getPropertySources().addFirst(new MapPropertySource("databaseUrlProps", props));
        }
    }

    private String convertToJdbcUrl(String databaseUrl) {
        // Replace postgres:// or postgresql:// with jdbc:postgresql://
        // Also strip out user:pass@ from the URL (Spring uses separate properties for
        // these)
        String url = databaseUrl
                .replace("postgres://", "jdbc:postgresql://")
                .replace("postgresql://", "jdbc:postgresql://");

        // If URL contains user:pass@, extract just the host part
        if (url.contains("@")) {
            String prefix = "jdbc:postgresql://";
            String afterPrefix = url.substring(prefix.length());
            String hostAndDb = afterPrefix.substring(afterPrefix.indexOf("@") + 1);
            url = prefix + hostAndDb;
        }

        return url;
    }
}
