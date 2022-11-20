package ch.zhaw.powerpuff.powerpuff.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ch.zhaw.powerpuff.powerpuff.model.Product;
//import ch.zhaw.powerpuff.powerpuff.model.ClothingType;
import ch.zhaw.powerpuff.powerpuff.model.ProductCreateDTO;
import ch.zhaw.powerpuff.powerpuff.model.aggregation.ProductByUserAggregationDTO;
import ch.zhaw.powerpuff.powerpuff.model.aggregation.ProductStateAggregationDTO;
import ch.zhaw.powerpuff.powerpuff.repository.ProductRepository;

@CrossOrigin(origins = "http://localhost:8080")
@RestController
@RequestMapping("/api/products")
public class ProductController {
    @Autowired
    ProductRepository productRepository;

    @PostMapping("")
    public ResponseEntity<Product> createUtility(
        @RequestBody ProductCreateDTO pDTO) {
            Product pDAO = new Product(pDTO.getDifficultyType(), pDTO.getClothingType(), pDTO.getProductType(), pDTO.getProductname(), pDTO.getDescription(), pDTO.getSize(), pDTO.getPatchart(), pDTO.getPrice());
            Product p = productRepository.save(pDAO);
            return new ResponseEntity<>(p, HttpStatus.CREATED);
        }
    
        @GetMapping("")
        public ResponseEntity<List<Product>> getAllProducts(){
            List<Product> allProducts = productRepository.findAll();
            return new ResponseEntity<>(allProducts, HttpStatus.OK);
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




   
}
