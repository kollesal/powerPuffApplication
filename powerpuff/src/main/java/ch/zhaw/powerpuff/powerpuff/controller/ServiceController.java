package ch.zhaw.powerpuff.powerpuff.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ch.zhaw.powerpuff.powerpuff.model.Product;
import ch.zhaw.powerpuff.powerpuff.model.ProductActivateDTO;
import ch.zhaw.powerpuff.powerpuff.model.ProductAssignDTO;
import ch.zhaw.powerpuff.powerpuff.model.ProductCloseDTO;
import ch.zhaw.powerpuff.powerpuff.model.ProductReviewDTO;
import ch.zhaw.powerpuff.powerpuff.model.User;
import ch.zhaw.powerpuff.powerpuff.model.UserCloseDTO;
import ch.zhaw.powerpuff.powerpuff.service.ProductService;
import ch.zhaw.powerpuff.powerpuff.service.UserService;

@RestController
@RequestMapping("/api/service")
public class ServiceController {

    @Autowired
    ProductService productService;

    @Autowired
    UserService userService;

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

    @PostMapping("/assigntome") 
public ResponseEntity<Product> assignToMe(@RequestParam String productId, 
@AuthenticationPrincipal Jwt jwt) {
 String userEmail = jwt.getClaimAsString("email");
 Optional<Product> product = productService.assignProductByEmail(productId, userEmail);
 if (product.isPresent()) {
 return new ResponseEntity<>(product.get(), HttpStatus.OK); 
 } 
 return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
}

    @PostMapping("/productactivation")
    public ResponseEntity<Product> activateProduct(
            @RequestBody ProductActivateDTO activateDTO) {
        // Service aufrufen. Falls die Zuweisung erfolgreich war

        if (activateDTO != null) {
            Optional<Product> Service = productService.activateProduct(activateDTO.getProductId());

            // das modifizierten Product mit Status OK zurückgeben, sonst BAD_REQUEST return
            // new
            return new ResponseEntity<>(Service.get(), HttpStatus.OK);
        }

        // ResponseEntity<>(HttpStatus.NOT_FOUND);
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);

    }

    @PostMapping("/productreview")
    public ResponseEntity<Product> reviewProduct(
            @RequestBody ProductReviewDTO reviewDTO) {
        // Service aufrufen. Falls die Zuweisung erfolgreich war

        if (reviewDTO != null) {
            Optional<Product> Service = productService.reviewProduct(reviewDTO.getProductId());

            // das modifizierten Product mit Status OK zurückgeben, sonst BAD_REQUEST return
            // new
            return new ResponseEntity<>(Service.get(), HttpStatus.OK);
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

    @PostMapping("/usercompletion")
    public ResponseEntity<User> closeUser(
            @RequestBody UserCloseDTO closeDTO) {
        // Service aufrufen. Falls die Zuweisung erfolgreich war

        if (closeDTO != null) {
            Optional<User> Service = userService.closeUser(closeDTO.getUserId(), closeDTO.getComment());

            // das modifizierten User mit Status OK zurückgeben, sonst BAD_REQUEST return
            // new
            return new ResponseEntity<>(Service.get(), HttpStatus.OK);
        }

        // ResponseEntity<>(HttpStatus.NOT_FOUND);
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);

    }

}
