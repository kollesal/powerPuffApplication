package ch.zhaw.powerpuff.powerpuff.repository;
import org.springframework.data.mongodb.repository.MongoRepository;

import ch.zhaw.powerpuff.powerpuff.model.Product;

public interface ProductRepository extends MongoRepository<Product, String>{
    
}
