package ch.zhaw.powerpuff.powerpuff.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ch.zhaw.powerpuff.powerpuff.model.User;
import ch.zhaw.powerpuff.powerpuff.model.UserCreateDTO;
import ch.zhaw.powerpuff.powerpuff.repository.UserRepository;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    UserRepository userRepository;

    @PostMapping("")
    public ResponseEntity<User> createUtility(
            @RequestBody UserCreateDTO uDTO) {
        User uDAO = new User(uDTO.getName(), uDTO.getUsername(), uDTO.getEmail());
        User u = userRepository.save(uDAO);
        return new ResponseEntity<>(u, HttpStatus.CREATED);
    }

    @GetMapping("")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> allUsers = userRepository.findAll();
        return new ResponseEntity<>(allUsers, HttpStatus.OK);

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
