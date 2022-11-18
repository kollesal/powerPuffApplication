package ch.zhaw.powerpuff.powerpuff.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import ch.zhaw.powerpuff.powerpuff.model.User;

public interface UserRepository extends MongoRepository<User, String> {
    
}
