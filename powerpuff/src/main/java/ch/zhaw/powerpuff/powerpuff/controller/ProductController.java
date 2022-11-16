package ch.zhaw.powerpuff.powerpuff.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ch.zhaw.powerpuff.powerpuff.model.Product;
import ch.zhaw.powerpuff.powerpuff.model.ProductCreateDTO;
import ch.zhaw.powerpuff.powerpuff.repository.ProductRepository;


@RestController
@RequestMapping("/api/products")
public class ProductController {
    @Autowired
    ProductRepository productRepository;

    @PostMapping("")
    public ResponseEntity<Product> createUtility(
        @RequestBody ProductCreateDTO pDTO) {
            Product pDAO = new Product(pDTO.getDifficultyType(), pDTO.getProductState(), pDTO.getDescription(), pDTO.getProductName());
            Product p = productRepository.save(pDAO);
            return new ResponseEntity<>(p, HttpStatus.CREATED);
        }
    
        @GetMapping("")
        public ResponseEntity<List<Product>> getAllProducts(){
            List<Product> allProducts = productRepository.findAll();

            if (!(allProducts.isEmpty())) {
            return new ResponseEntity<>(allProducts, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        }

        @GetMapping("{id}")
        public ResponseEntity<Product> getProductById(@PathVariable String id) {
            Optional<Product> optProduct = productRepository.findById(id);
            if (optProduct.isPresent()){
                return new ResponseEntity<>(optProduct.get(), HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        }
   
}
