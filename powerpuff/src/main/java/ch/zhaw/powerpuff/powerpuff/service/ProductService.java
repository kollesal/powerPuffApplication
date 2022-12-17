package ch.zhaw.powerpuff.powerpuff.service;

import java.util.List;
import java.util.Optional;

//import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import ch.zhaw.powerpuff.powerpuff.model.Product;
import ch.zhaw.powerpuff.powerpuff.model.User;
import ch.zhaw.powerpuff.powerpuff.model.types.ProductState;
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
        if (userRepository.findById(userId).isPresent()) {
            Optional<Product> productToAssign = productRepository.findById(productId);
            if (productToAssign.isPresent()) {
                Product product = productToAssign.get();
                if (product.getProductState() != ProductState.INACTIVE) {

                    // Neuer Zustand und UserId setzen
                    product.setProductState(ProductState.REVIEW);
                    product.setUserId(userId);

                    // Product speichern
                    productRepository.save(product);

                    return Optional.of(product);
                }
            }
        }
        return Optional.empty();
    }

    public Optional<Product> assignProductByEmail(String productId, String email) {
        List<User> uList = userRepository.findByEmail(email);
        if (uList.size() == 1) {
            return assignProduct(productId, uList.get(0).getId());
        }
        return Optional.empty();
    }

    public Optional<Product> reviewProduct(String productId) {
        if (productRepository.findById(productId).isPresent()) {
            Optional<Product> productToReview = productRepository.findById(productId);
            if (productToReview.isPresent()) {
                Product product = productToReview.get();
                if (product.getProductState() == ProductState.NEW) {

                    // Neuer Zustand setzen
                    product.setProductState(ProductState.REVIEW);

                    // Product speichern
                    productRepository.save(product);

                    return Optional.of(product);
                }
            }
        }
        return Optional.empty();
    }

    public Optional<Product> activateProduct(String productId) {
        if (productRepository.findById(productId).isPresent()) {
            Optional<Product> productToActivate = productRepository.findById(productId);
            if (productToActivate.isPresent()) {
                Product product = productToActivate.get();
                if (product.getProductState() == ProductState.REVIEW || product.getProductState() == ProductState.INACTIVE) {

                    // Neuer Zustand setzen
                    product.setProductState(ProductState.ACTIVE);

                    // Product speichern
                    productRepository.save(product);

                    return Optional.of(product);
                }
            }
        }
        return Optional.empty();
    }

    public Optional<Product> closeProduct(String productId, String comment) {
        if (productRepository.findById(productId).isPresent()) {
            Optional<Product> productToClose = productRepository.findById(productId);
            if (productToClose.isPresent()) {
                Product product = productToClose.get();
                if (product.getProductState() == ProductState.ACTIVE) {

                    // Neuer Zustand und UserId setzen
                    product.setProductState(ProductState.INACTIVE);
                    product.setComment(comment);

                    // Product speichern
                    productRepository.save(product);

                    return Optional.of(product);
                }
            }
        }
        return Optional.empty();
    }

//--------------------------------------------------------------------------------------------------
// UTILITY ANBINDUNG
//--------------------------------------------------------------------------------------------------

    public Optional<Product> assignUtility(String productId, String utilityId) {
        if (utilityRepository.findById(utilityId).isPresent()) {
            Optional<Product> utilityToAssign = productRepository.findById(productId);
            if (utilityToAssign.isPresent()) {
                Product product = utilityToAssign.get();
                if (product.getProductState() != ProductState.INACTIVE) {

                    // Neue utilityId setzen
                    product.utilityIds.add(utilityId);

                    // Product speichern
                    productRepository.save(product);

                    return Optional.of(product);
                }
            }
        }
        return Optional.empty();
    }

}
