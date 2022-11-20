package ch.zhaw.powerpuff.powerpuff.service;

import java.util.Optional;

//import java.util.Optional;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import ch.zhaw.powerpuff.powerpuff.model.Product;
import ch.zhaw.powerpuff.powerpuff.model.ProductState;
import ch.zhaw.powerpuff.powerpuff.repository.ProductRepository;
import ch.zhaw.powerpuff.powerpuff.repository.UserRepository;
import ch.zhaw.powerpuff.powerpuff.repository.UtilityRepository;

@Service
public class ProductService {

    @Autowired
    UtilityRepository utilityRepository;

    @Autowired
    ProductRepository productRepository;

    @Autowired
    UserRepository userRepository;

    public Optional<Product> assignProduct(String productId, String userId) {
        if(userRepository.findById(userId).isPresent()) {
            Optional<Product> productToAssign = productRepository.findById(productId);
        if (productToAssign.isPresent()){
            Product product = productToAssign.get();
            if (product.getProductState() == ProductState.NEW) {

                //Neuer Zustand und UserId setzen
                product.setProductState(ProductState.ACTIVE);
                product.setUserId(userId);
                
                //Product speichern
                productRepository.save(product);

                return Optional.of(product);
            }
        }
    }
        return Optional.empty();
    }

    public Optional<Product> closeProduct(String productId, String comment) {
        if(productRepository.findById(productId).isPresent()) {
            Optional<Product> productToClose = productRepository.findById(productId);
        if (productToClose.isPresent()){
            Product product = productToClose.get();
            if (product.getProductState() == ProductState.ACTIVE) {

                //Neuer Zustand und UserId setzen
                product.setProductState(ProductState.INACTIVE);
                product.setComment(comment);
                
                //Job speichern
                productRepository.save(product);

                return Optional.of(product);
            }
        }
    }
    return Optional.empty();
}

}