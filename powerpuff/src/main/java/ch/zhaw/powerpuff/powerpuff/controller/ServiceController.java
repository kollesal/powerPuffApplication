package ch.zhaw.powerpuff.powerpuff.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ch.zhaw.powerpuff.powerpuff.API.Root;
import ch.zhaw.powerpuff.powerpuff.model.Product;
import ch.zhaw.powerpuff.powerpuff.model.User;
import ch.zhaw.powerpuff.powerpuff.model.status.EmailValidationDTO;
import ch.zhaw.powerpuff.powerpuff.model.status.ProductActivateDTO;
import ch.zhaw.powerpuff.powerpuff.model.status.ProductAssignDTO;
import ch.zhaw.powerpuff.powerpuff.model.status.ProductCloseDTO;
import ch.zhaw.powerpuff.powerpuff.model.status.ProductReviewDTO;
import ch.zhaw.powerpuff.powerpuff.model.status.UserActivateDTO;
import ch.zhaw.powerpuff.powerpuff.model.status.UserChangeUserTypeDTO;
import ch.zhaw.powerpuff.powerpuff.model.status.UserCloseDTO;
import ch.zhaw.powerpuff.powerpuff.model.status.UtilityAssignDTO;
import ch.zhaw.powerpuff.powerpuff.service.ConnectionService;
import ch.zhaw.powerpuff.powerpuff.service.ProductService;
import ch.zhaw.powerpuff.powerpuff.service.UserService;

@RestController
@RequestMapping("/api/service")
public class ServiceController {

    @Autowired
    ProductService productService;

    @Autowired
    UserService userService;

    @Autowired
    ConnectionService connectionService;

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

    @PostMapping("/useractivation")
    public ResponseEntity<User> activateUser(
            @RequestBody UserActivateDTO activateDTO) {
        // Service aufrufen. Falls die Zuweisung erfolgreich war

        if (activateDTO != null) {
            Optional<User> Service = userService.activateUser(activateDTO.getUserId());

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

    @PostMapping("/userchangetype")
    public ResponseEntity<User> changeUserTypeUser(
            @RequestBody UserChangeUserTypeDTO changeUserTypeDTO) {
        // Service aufrufen. Falls die Zuweisung erfolgreich war

        if (changeUserTypeDTO != null) {
            Optional<User> Service = userService.changeUserTypeUser(changeUserTypeDTO.getUserId(), changeUserTypeDTO.getUserType());

            // das modifizierten Product mit Status OK zurückgeben, sonst BAD_REQUEST return
            // new
            return new ResponseEntity<>(Service.get(), HttpStatus.OK);
        }

        // ResponseEntity<>(HttpStatus.NOT_FOUND);
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);

    }

    // API ANBINDUNG

    @GetMapping("emailvalidation")
    public ResponseEntity<List<EmailValidationDTO>> emailvalidation(@RequestParam List<String> 
    email){
    // Get data from Service
        Root emailVal = connectionService.getEmail(email.get(0));
    // Empty List
    List<EmailValidationDTO> emailValDTO = new ArrayList<>();
    //for (User user : emailVal.emailVal) {
        EmailValidationDTO dto = new EmailValidationDTO(emailVal.status, emailVal.data.email_address, emailVal.data.domain, emailVal.data.deliverable
        );
        // Adds connection to List
        emailValDTO.add(dto);
        
        return new ResponseEntity<>(emailValDTO, HttpStatus.OK);
    }

//--------------------------------------------------------------------------------------------------
// UTILITY ANBINDUNG
//--------------------------------------------------------------------------------------------------

    @PostMapping("/utilityassignment")
    public ResponseEntity<Product> assignUtility(
            @RequestBody UtilityAssignDTO assignDTO) {
        // Service aufrufen. Falls die Zuweisung erfolgreich war
        if (assignDTO != null) {
            Optional<Product> newService = productService.assignUtility(assignDTO.getProductId(),
                    assignDTO.getUtilityId());

            // den modifiziertes Product mit Status OK zurückgeben, sonst BAD_REQUEST return
            // new
            return new ResponseEntity<>(newService.get(), HttpStatus.OK);
        }

        // ResponseEntity<>(HttpStatus.NOT_FOUND);
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

}
