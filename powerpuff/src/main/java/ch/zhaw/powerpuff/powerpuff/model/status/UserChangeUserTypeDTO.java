package ch.zhaw.powerpuff.powerpuff.model.status;
import ch.zhaw.powerpuff.powerpuff.model.UserType;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Getter
public class UserChangeUserTypeDTO {
    private String userId;
    private UserType userType;
}
