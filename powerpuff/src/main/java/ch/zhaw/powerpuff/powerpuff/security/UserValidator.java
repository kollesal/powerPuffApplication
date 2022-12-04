package ch.zhaw.powerpuff.powerpuff.security;

import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;

import ch.zhaw.powerpuff.powerpuff.model.User;
import ch.zhaw.powerpuff.powerpuff.repository.UserRepository;

class UserValidator implements OAuth2TokenValidator<Jwt> {

    UserRepository userRepository;

    public UserValidator(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public OAuth2TokenValidatorResult validate(Jwt jwt) {
        OAuth2Error error = new OAuth2Error("invalid_token", "The required email is missing", null);

        String email = jwt.getClaimAsString("email");
        if (email != null && !email.equals("")) { 
            if (userRepository.findByEmail(email).size() == 0) {     
                String username = jwt.getClaimAsString("nickname");
                String name = jwt.getClaimAsString("name");
                userRepository.save(new User(email, username, name));
            }
            return OAuth2TokenValidatorResult.success();
        }
        return OAuth2TokenValidatorResult.failure(error);
    }
}
