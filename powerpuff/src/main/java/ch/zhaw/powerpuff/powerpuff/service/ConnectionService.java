package ch.zhaw.powerpuff.powerpuff.service;
import java.time.Duration;
import org.slf4j.LoggerFactory;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import org.springframework.web.reactive.function.client.WebClient;

import ch.zhaw.powerpuff.powerpuff.API.Root;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@Service
public class ConnectionService {

    private static final String OPENDATA_TRANSPORT_BASE_URL = "https://api.eva.pingutil.com/email";

    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(3);
    private static final String USER_AGENT = "Spring 5 WebClient";
    private static final Logger logger = LoggerFactory.getLogger(ConnectionService.class);

    private final WebClient webClient;

    @Autowired
    public ConnectionService() {
        this.webClient = WebClient.builder()
                .baseUrl(OPENDATA_TRANSPORT_BASE_URL)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.USER_AGENT, USER_AGENT)
                .filter(logRequest())
                .build();
    }


    private ExchangeFilterFunction logRequest() {
        return (clientRequest, next) -> {
            logger.info("Request: {} {}", clientRequest.method(), clientRequest.url());
            clientRequest.headers()
                    .forEach((name, values) -> values.forEach(value -> logger.info("{}={}", name, value)));
            return next.exchange(clientRequest);
        };
    }

    public Root getEmail(String email) {
        return webClient
        .get() //http-method
        .uri("?email=" + email) // uri to api
        .retrieve()
        .bodyToMono(Root.class) // mapping to a certain class
        .block(REQUEST_TIMEOUT);
        }
}
