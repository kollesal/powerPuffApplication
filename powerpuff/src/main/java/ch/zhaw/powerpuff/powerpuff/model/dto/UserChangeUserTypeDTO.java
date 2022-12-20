package ch.zhaw.powerpuff.powerpuff.model.dto;
import ch.zhaw.powerpuff.powerpuff.model.types.UserType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@RequiredArgsConstructor
@Getter
@Setter
public class UserChangeUserTypeDTO {

    @NonNull
    private String userId;
    @NonNull
    private UserType userType;
    
}
