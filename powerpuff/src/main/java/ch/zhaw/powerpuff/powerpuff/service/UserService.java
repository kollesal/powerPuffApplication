package ch.zhaw.powerpuff.powerpuff.service;
import java.util.Optional;

//import java.util.Optional;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import ch.zhaw.powerpuff.powerpuff.model.User;
import ch.zhaw.powerpuff.powerpuff.model.types.UserStatus;
import ch.zhaw.powerpuff.powerpuff.model.types.UserType;
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

    public Optional<User> activateUser(String userId) {
        if (userRepository.findById(userId).isPresent()) {
            Optional<User> userToActivate = userRepository.findById(userId);
            if (userToActivate.isPresent()) {
                User user = userToActivate.get();
                if (user.getUserStatus() == UserStatus.INACTIVE) {

                    // Neuer Zustand setzen
                    user.setUserStatus(UserStatus.ACTIVE);

                    // Product speichern
                    userRepository.save(user);

                    return Optional.of(user);
                }
            }
        }
        return Optional.empty();
    }

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

public Optional<User> changeUserTypeUser(String userId, UserType userType) {
    if (userRepository.findById(userId).isPresent()) {
        Optional<User> userToChangeType = userRepository.findById(userId);
        if (userToChangeType.isPresent()) {
            User user = userToChangeType.get();
            if (user.getUserStatus() == UserStatus.ACTIVE) {

                // Neuer Zustand setzen

                if(userType == UserType.BUYER) {
                    user.setUserType(UserType.BUYER);
                } else if(userType == UserType.SUPPLIER) {
                    user.setUserType(UserType.SUPPLIER);
                } else if(userType == UserType.ADMIN) {
                    user.setUserType(UserType.ADMIN);
                }
                

                // Product speichern
                userRepository.save(user);

                return Optional.of(user);
            }
        }
    }
    return Optional.empty();
}


}
