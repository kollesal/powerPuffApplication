package ch.zhaw.powerpuff.powerpuff.model;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Getter
public class UserCreateDTO {
    
    private UserStatus userStatus;
    private String eMail;
    private String username;
    private String name;
    private String password;
    
}
