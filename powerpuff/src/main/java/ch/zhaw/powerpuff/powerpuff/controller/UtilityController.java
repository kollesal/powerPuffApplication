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

import ch.zhaw.powerpuff.powerpuff.model.Utility;
import ch.zhaw.powerpuff.powerpuff.model.status.UtilityCreateDTO;
import ch.zhaw.powerpuff.powerpuff.repository.UtilityRepository;

@RestController
@RequestMapping("/api/utilities")
public class UtilityController {
    @Autowired
    UtilityRepository utilityRepository;

    @PostMapping("")
    public ResponseEntity<Utility> createUtility(
            @RequestBody UtilityCreateDTO uDTO) {
        Utility uDAO = new Utility(uDTO.getUtilityName(), uDTO.getUnit(), uDTO.getUtilityType());
        Utility u = utilityRepository.save(uDAO);
        return new ResponseEntity<>(u, HttpStatus.CREATED);
    }

    @GetMapping("")
    public ResponseEntity<List<Utility>> getAllUtilities() {
        List<Utility> allUtilities = utilityRepository.findAll();
        return new ResponseEntity<>(allUtilities, HttpStatus.OK);
    }

    @GetMapping("{id}")
    public ResponseEntity<Utility> getUtilityById(@PathVariable String id) {
        Optional<Utility> optUtility = utilityRepository.findById(id);
        if (optUtility.isPresent()) {
            return new ResponseEntity<>(optUtility.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("")
    public ResponseEntity<String> deleteAllUtilities() {
        utilityRepository.deleteAll();
        return ResponseEntity.status(HttpStatus.OK).body("All Utilities have been deleted successfully");
    }

    @DeleteMapping("{id}")
    public ResponseEntity<String> deleteUtilityById(@PathVariable String id) {
        Optional<Utility> utility = utilityRepository.findById(id);
        if (utility.isPresent()) {
            this.utilityRepository.delete(utility.get());

            return ResponseEntity.status(HttpStatus.OK).body("Utility has been deleted successfully");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

}
