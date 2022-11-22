package ch.zhaw.powerpuff.powerpuff.repository;
import java.util.List;

import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;

import ch.zhaw.powerpuff.powerpuff.model.Product;
import ch.zhaw.powerpuff.powerpuff.model.aggregation.ProductByUserAggregationDTO;
import ch.zhaw.powerpuff.powerpuff.model.aggregation.ProductStateAggregationDTO;

public interface ProductRepository extends MongoRepository<Product, String>{

    List<Product> findByPriceGreaterThan(Double price);

    List<Product> findByPriceBetween(Double min, Double max);

    @Aggregation("{$group: {_id: '$productState',productIds: {$push: '$_id'}, count: {$count: {}}}}")
      List<ProductStateAggregationDTO> getProductStateAggregation();
    
      @Aggregation("{$group: {_id: '$userId', productIds: {$push: '$_id'}, totalPrices: {$sum: '$prices'}}}")
      List<ProductByUserAggregationDTO> getProductByUserAggregation();

      List<Product> findByProductState(String state);
}
