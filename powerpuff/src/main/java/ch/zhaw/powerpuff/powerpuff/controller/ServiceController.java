package ch.zhaw.powerpuff.powerpuff.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ch.zhaw.powerpuff.powerpuff.model.Product;
import ch.zhaw.powerpuff.powerpuff.model.ProductAssignDTO;
import ch.zhaw.powerpuff.powerpuff.model.ProductCloseDTO;
import ch.zhaw.powerpuff.powerpuff.service.ProductService;

@RestController
@RequestMapping("/api/service")
public class ServiceController {

    @Autowired
    ProductService productService;

    @PostMapping("/productassignment")
    public ResponseEntity<Product> assignProduct(
            @RequestBody ProductAssignDTO assignDTO) {
        // Service aufrufen. Falls die Zuweisung erfolgreich war

        if (assignDTO != null) {
            Optional<Product> newService = productService.assignProduct(assignDTO.getProductId(),
                    assignDTO.getUserId());

            // den modifiziertes Product mit Status OK zurückgeben, sonst BAD_REQUEST return
            // new
            return new ResponseEntity<>(newService.get(), HttpStatus.OK);
        }

        // ResponseEntity<>(HttpStatus.NOT_FOUND);
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping("/productcompletion")
    public ResponseEntity<Product> closeProduct(
            @RequestBody ProductCloseDTO closeDTO) {
        // Service aufrufen. Falls die Zuweisung erfolgreich war

        if (closeDTO != null) {
            Optional<Product> Service = productService.closeProduct(closeDTO.getProductId(), closeDTO.getComment());

            // das modifizierten Product mit Status OK zurückgeben, sonst BAD_REQUEST return
            // new
            return new ResponseEntity<>(Service.get(), HttpStatus.OK);
        }

        // ResponseEntity<>(HttpStatus.NOT_FOUND);
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);

    }

}
