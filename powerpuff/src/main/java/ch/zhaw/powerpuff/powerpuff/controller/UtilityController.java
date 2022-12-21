package ch.zhaw.powerpuff.powerpuff.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ch.zhaw.powerpuff.powerpuff.model.Utility;
import ch.zhaw.powerpuff.powerpuff.model.dto.UtilityCreateDTO;
import ch.zhaw.powerpuff.powerpuff.model.dto.UtilityUpdateDTO;
import ch.zhaw.powerpuff.powerpuff.repository.UtilityRepository;
import ch.zhaw.powerpuff.powerpuff.security.UserValidator;

@CrossOrigin(origins = "https://powerpuff-1671620117973.azurewebsites.net")
@RestController
@RequestMapping("/api/utilities")
public class UtilityController {
    @Autowired
    UtilityRepository utilityRepository;

    @PostMapping("")
    public ResponseEntity<Utility> createUtility(
            @RequestBody UtilityCreateDTO uDTO,
            @AuthenticationPrincipal Jwt jwt) {
                
        if (UserValidator.userHasRole(jwt, "buyer")) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        Utility uDAO = new Utility(uDTO.getUtilityName(), uDTO.getUnit(), uDTO.getUtilityType());
        Utility u = utilityRepository.save(uDAO);
        return new ResponseEntity<>(u, HttpStatus.CREATED);
    }

    @GetMapping("")
    public ResponseEntity<Page<Utility>> getAllUtilities(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) Integer pageSize,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) String type) {

        if (UserValidator.userHasRole(jwt, "buyer")) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        if (page == null) {
            page = 1;
        }
        if (pageSize == null) {
            pageSize = 6;
        }

        Page<Utility> allUtilities;
        if (type != null) {
            System.out.println(type);
            allUtilities = utilityRepository
                    .findByUtilityType(type, PageRequest.of(page - 1, pageSize));
        } else {
            allUtilities = utilityRepository
                    .findAll(PageRequest.of(page - 1, pageSize));
        }

        return new ResponseEntity<>(allUtilities, HttpStatus.OK);
    }

    @PatchMapping("{id}")
    public ResponseEntity<Utility> updateUtility(
            @RequestBody UtilityUpdateDTO uDTO,
            @PathVariable String id,
            @AuthenticationPrincipal Jwt jwt) {

                if (UserValidator.userHasRole(jwt, "buyer")) {
                    return new ResponseEntity<>(HttpStatus.FORBIDDEN);
                }    

        Optional<Utility> uDAO = utilityRepository.findById(id);
        if (uDAO.isPresent()) {
            Utility utility = uDAO.get();
            utility.setUtilityName(uDTO.getUtilityName());
            utility.setUtilityType(uDTO.getUtilityType());
            utility.setUnit(uDTO.getUnit());
            utilityRepository.save(utility);
            return new ResponseEntity<>(utility, HttpStatus.OK);

        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("{id}")
    public ResponseEntity<Utility> getUtilityById(
            @PathVariable String id,
            @AuthenticationPrincipal Jwt jwt) {

        if (UserValidator.userHasRole(jwt, "buyer")) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        Optional<Utility> optUtility = utilityRepository.findById(id);
        if (optUtility.isPresent()) {
            return new ResponseEntity<>(optUtility.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("")
    public ResponseEntity<String> deleteAllUtilities(
    @AuthenticationPrincipal Jwt jwt) {

        if (UserValidator.userHasRole(jwt, "buyer")) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        utilityRepository.deleteAll();
        return ResponseEntity.status(HttpStatus.OK).body("All Utilities have been deleted successfully");
    }

    @DeleteMapping("{id}")
    public ResponseEntity<String> deleteUtilityById(
        @PathVariable String id,
        @AuthenticationPrincipal Jwt jwt) {

            if (UserValidator.userHasRole(jwt, "buyer")) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }

        Optional<Utility> utility = utilityRepository.findById(id);
        if (utility.isPresent()) {
            this.utilityRepository.delete(utility.get());

            return ResponseEntity.status(HttpStatus.OK).body("Utility has been deleted successfully");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

}
