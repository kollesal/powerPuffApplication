package ch.zhaw.powerpuff.powerpuff.model;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Getter
public class UserCreateDTO {
    
   // private UserStatus userStatus;
    //private UserType userType;
    private String email;
    private String username;
    private String name;
   // private String password;
    
}
