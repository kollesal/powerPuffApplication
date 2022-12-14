package ch.zhaw.powerpuff.powerpuff.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ch.zhaw.powerpuff.powerpuff.model.User;
import ch.zhaw.powerpuff.powerpuff.model.status.UserCreateDTO;
import ch.zhaw.powerpuff.powerpuff.repository.UserRepository;
import ch.zhaw.powerpuff.powerpuff.security.UserValidator;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    UserRepository userRepository;

    @PostMapping("")
    public ResponseEntity<User> createUser(
            @RequestBody UserCreateDTO uDTO,
            @AuthenticationPrincipal Jwt jwt) {

                if (!UserValidator.userHasRole(jwt, "admin")) {
                    return new ResponseEntity<>(HttpStatus.FORBIDDEN);
                    } 
                
        User uDAO = new User( uDTO.getEmail(), uDTO.getUsername(), uDTO.getName());
        User u = userRepository.save(uDAO);
        return new ResponseEntity<>(u, HttpStatus.CREATED);
    }

    @GetMapping("")
    public ResponseEntity<Page<User>> getAllUsers(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer pageSize) {
        if (page == null) {
            page = 1;
        }
        if (pageSize == null) {
            pageSize = 6;
        }

        Page<User> allUsers;
            allUsers = userRepository
                    .findAll(PageRequest.of(page - 1, pageSize));
                    if (!allUsers.isEmpty()) {  
        return new ResponseEntity<>(allUsers, HttpStatus.OK);
    } else {
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}

    @GetMapping("{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        Optional<User> optUser = userRepository.findById(id);
        if (optUser.isPresent()) {
            return new ResponseEntity<>(optUser.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("")
    public ResponseEntity<String> deleteAllJob() {
        userRepository.deleteAll();
        return ResponseEntity.status(HttpStatus.OK).body("All Users have been deleted successfully");
    }

    @DeleteMapping("{id}")
    public ResponseEntity<String> deleteUserById(@PathVariable String id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()) {
            this.userRepository.delete(user.get());

            return ResponseEntity.status(HttpStatus.OK).body("User has been deleted successfully");
        } else {
            return ResponseEntity.notFound().build();
        }
    }


}
