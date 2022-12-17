package ch.zhaw.powerpuff.powerpuff.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ch.zhaw.powerpuff.powerpuff.model.Product;
import ch.zhaw.powerpuff.powerpuff.model.aggregation.ProductByProducttypeAggregationDTO;
import ch.zhaw.powerpuff.powerpuff.model.aggregation.ProductByUserAggregationDTO;
import ch.zhaw.powerpuff.powerpuff.model.aggregation.ProductStateAggregationDTO;
import ch.zhaw.powerpuff.powerpuff.model.status.ProductCreateDTO;
import ch.zhaw.powerpuff.powerpuff.repository.ProductRepository;
import ch.zhaw.powerpuff.powerpuff.security.UserValidator;

@CrossOrigin(origins = "http://localhost:8080")
@RestController
@RequestMapping("/api/products")
public class ProductController {
    @Autowired
    ProductRepository productRepository;

    @PostMapping("")
    public ResponseEntity<Product> createProduct(
            @RequestBody ProductCreateDTO pDTO, 
            @AuthenticationPrincipal Jwt jwt) {

                if (UserValidator.userHasRole(jwt, "buyer")) {
                    return new ResponseEntity<>(HttpStatus.FORBIDDEN);
                    } 

        Product pDAO = new Product(pDTO.getDifficultyType(), pDTO.getClothingType(), pDTO.getProductType(),
                pDTO.getProductname(), pDTO.getDescription(), pDTO.getSize(), pDTO.getPatchart(), pDTO.getPrice());
        Product p = productRepository.save(pDAO);
        return new ResponseEntity<>(p, HttpStatus.CREATED);
    }

    @GetMapping("{id}")
    public ResponseEntity<Product> getProductById(@PathVariable String id) {
        Optional<Product> optProduct = productRepository.findById(id);
        if (optProduct.isPresent()) {
            return new ResponseEntity<>(optProduct.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("")
    public ResponseEntity<Page<Product>> getAllProducts(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer pageSize,
            @RequestParam(required = false) Double min,
            @RequestParam(required = false) Double max,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String user,
            @RequestParam(required = false) String state) {
        if (page == null) {
            page = 1;
        }
        if (pageSize == null) {
            pageSize = 2;
        }

        Page<Product> allProducts;
         if (min != null && max != null && type != null && user != null) {
            allProducts = productRepository
                    .findByProductTypeAndPriceBetweenAndUserId(type, min, max, user, PageRequest.of(page - 1, pageSize));
        } else if (min != null && max != null && type == null && user != null) {
            allProducts = productRepository
                    .findByUserIdAndPriceBetween(user, min, max, PageRequest.of(page - 1, pageSize));
        } else if (min == null && max == null && type != null && user != null) {
            allProducts = productRepository
                    .findByUserIdAndProductType(user, type, PageRequest.of(page - 1, pageSize));
        } else if (min != null && max != null && type != null && user == null) {
            allProducts = productRepository
                    .findByProductTypeAndPriceBetween(type, min, max, PageRequest.of(page - 1, pageSize));
        } else if (min != null && max != null && type == null && user == null) {
            allProducts = productRepository
                    .findByPriceBetween(min, max, PageRequest.of(page - 1, pageSize));
        } else if (min != null) {
            allProducts = productRepository
                    .findByPriceGreaterThan(min, PageRequest.of(page - 1, pageSize));
        } else if (type != null) {
            allProducts = productRepository
                    .findByProductType(type, PageRequest.of(page - 1, pageSize));
        } else if (user != null) {
            allProducts = productRepository
                    .findByUserId(user, PageRequest.of(page - 1, pageSize));
        } else if (state != null) {
            allProducts = productRepository
                    .findByProductState(state, PageRequest.of(page - 1, pageSize));
        } else {
            allProducts = productRepository
                    .findAll(PageRequest.of(page - 1, pageSize));
        }

        return new ResponseEntity<>(allProducts, HttpStatus.OK);
 
   /*   if (min == null){
    min = ".*";
    } else if (max == null) {
       max = ".*";
    } else if (type == null) {
       type = ".*";
    } else if (user == null) {
       user = ".*";
    } else if (state == null) {
       state = ".*";
    }
allProducts = productRepository
        .findByQueryWithParameters(state, type, min, max, user, PageRequest.of(page - 1, pageSize)); 
    return new ResponseEntity<>(allProducts, HttpStatus.OK); */
    }

    @GetMapping("/pricesabove")
    public ResponseEntity<List<Product>> getProductMinPrice(@RequestParam Double min) {

        return new ResponseEntity<>(productRepository
                .findByPriceGreaterThan(min), HttpStatus.OK);
    }

    @GetMapping("/priceinrange")
    public ResponseEntity<List<Product>> getProductPriceInRange(@RequestParam Double min, @RequestParam Double max) {

        return new ResponseEntity<>(productRepository
                .findByPriceBetween(min, max), HttpStatus.OK);
    }

    @GetMapping("/bystate")
    public ResponseEntity<List<ProductStateAggregationDTO>> getProdcutStateAggregation() {

        return new ResponseEntity<>(productRepository.getProductStateAggregation(), HttpStatus.OK);
    }

    @GetMapping("/byuser")
    public ResponseEntity<List<ProductByUserAggregationDTO>> getProductByUserAggregation() {

        return new ResponseEntity<>(productRepository.getProductByUserAggregation(), HttpStatus.OK);
    }

    @GetMapping("/byproducttype")
    public ResponseEntity<List<ProductByProducttypeAggregationDTO>> getProductByProducttypeAggregation() {

        return new ResponseEntity<>(productRepository.getProducttypeAggregation(), HttpStatus.OK);
    }

    @GetMapping("/producttype")
    public ResponseEntity<List<Product>> getProductType(@RequestParam String type) {

        return new ResponseEntity<>(productRepository
                .findByProductType(type), HttpStatus.OK);
    }

    @GetMapping("/productstate")
    public ResponseEntity<List<Product>> getProductState(@RequestParam String state) {

        return new ResponseEntity<>(productRepository
                .findByProductState(state), HttpStatus.OK);
    }

    @DeleteMapping("")
    public ResponseEntity<String> deleteAllProducts() {
        productRepository.deleteAll();
        return ResponseEntity.status(HttpStatus.OK).body("All Products have been deleted successfully");
    }

    @DeleteMapping("{id}")
    public ResponseEntity<String> deleteProductById(@PathVariable String id) {
        Optional<Product> product = productRepository.findById(id);
        if (product.isPresent()) {
            this.productRepository.delete(product.get());

            return ResponseEntity.status(HttpStatus.OK).body("Product has been deleted successfully");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

}
