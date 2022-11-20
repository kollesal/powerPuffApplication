package ch.zhaw.powerpuff.powerpuff.service;
import java.util.Optional;

//import java.util.Optional;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import ch.zhaw.powerpuff.powerpuff.model.User;
import ch.zhaw.powerpuff.powerpuff.model.UserStatus;
import ch.zhaw.powerpuff.powerpuff.repository.ProductRepository;
import ch.zhaw.powerpuff.powerpuff.repository.UserRepository;
import ch.zhaw.powerpuff.powerpuff.repository.UtilityRepository;

@Service
public class UserService {
    @Autowired
    UtilityRepository utilityRepository;

    @Autowired
    ProductRepository productRepository;

    @Autowired
    UserRepository userRepository;

    public Optional<User> closeUser(String userId, String comment) {
        if(userRepository.findById(userId).isPresent()) {
            Optional<User> userToClose = userRepository.findById(userId);
        if (userToClose.isPresent()){
            User user = userToClose.get();
            if (user.getUserStatus() == UserStatus.ACTIVE) {

                //Neuer Zustand und UserId setzen
                user.setUserStatus(UserStatus.INACTIVE);
                user.setComment(comment);
                
                //Job speichern
                userRepository.save(user);

                return Optional.of(user);
            }
        }
    }
    return Optional.empty();
}

    
}
