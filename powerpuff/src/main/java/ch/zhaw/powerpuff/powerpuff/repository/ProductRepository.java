package ch.zhaw.powerpuff.powerpuff.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;

import ch.zhaw.powerpuff.powerpuff.model.Product;
import ch.zhaw.powerpuff.powerpuff.model.aggregation.ProductByProducttypeAggregationDTO;
import ch.zhaw.powerpuff.powerpuff.model.aggregation.ProductByUserAggregationDTO;
import ch.zhaw.powerpuff.powerpuff.model.aggregation.ProductStateAggregationDTO;

public interface ProductRepository extends MongoRepository<Product, String> {

  List<Product> findByPriceGreaterThan(Double price);
  List<Product> findByPriceBetween(Double min, Double max);
  List<Product> findByProductType(String type);
  List<Product> findByProductTypeAndPriceBetween(String type, Double min, Double max);

  List<Product> findByUserId(String user_id);
  List<Product> findByUserIdAndPriceBetween(String user_id, Double min, Double max);
  List<Product> findByUserIdAndProductType(String user_id, String type);
  List<Product> findByProductTypeAndPriceBetweenAndUserId(String type, Double min, Double max, String user_id);

  List<Product> findByProductState(String state);

  Page<Product> findByPriceGreaterThan(Double price, Pageable pageable);
  Page<Product> findByPriceBetween(Double min, Double max, Pageable pageable);
  Page<Product> findByProductType(String type, Pageable pageable);
  Page<Product> findByProductTypeAndPriceBetween(String type, Double min, Double max, Pageable pageable);
  
  Page<Product> findByUserId(String user_id, Pageable pageable);
  Page<Product> findByUserIdAndPriceBetween(String user_id, Double min, Double max, Pageable pageable);
  Page<Product> findByUserIdAndProductType(String user_id, String type, Pageable pageable);
  Page<Product> findByProductTypeAndPriceBetweenAndUserId(String type, Double min, Double max, String user_id, Pageable pageable);

  Page<Product> findByProductState(String status, Pageable pageable);

  @Aggregation("{$group: {_id: '$productState',productIds: {$push: '$_id'}, count: {$count: {}}}}")
  List<ProductStateAggregationDTO> getProductStateAggregation();

  @Aggregation("{$group: {_id: '$userId', productIds: {$push: '$_id'}, totalPrices: {$sum: '$price'}}}")
  List<ProductByUserAggregationDTO> getProductByUserAggregation();

  @Aggregation("{$group: {_id: '$productType',productIds: {$push: '$_id'}, totalPrices: {$sum: '$price'}}}")
  List<ProductByProducttypeAggregationDTO> getProducttypeAggregation();

}
