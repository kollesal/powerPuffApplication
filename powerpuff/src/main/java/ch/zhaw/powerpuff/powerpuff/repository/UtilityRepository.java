package ch.zhaw.powerpuff.powerpuff.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import ch.zhaw.powerpuff.powerpuff.model.Utility;

public interface UtilityRepository extends MongoRepository<Utility, String>{

    List<Utility> findByUtilityType(String type);

    Page<Utility> findByUtilityType(String type, Pageable pageable);

    
}
