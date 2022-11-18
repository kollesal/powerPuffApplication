package ch.zhaw.powerpuff.powerpuff.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import ch.zhaw.powerpuff.powerpuff.model.Utility;

public interface UtilityRepository extends MongoRepository<Utility, String>{

    
}
