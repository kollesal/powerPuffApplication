package ch.zhaw.powerpuff.powerpuff.model.status;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Getter
@Setter
public class UserUpdateDTO {

    private String name;
    private String username;
    private String email;

    
}
