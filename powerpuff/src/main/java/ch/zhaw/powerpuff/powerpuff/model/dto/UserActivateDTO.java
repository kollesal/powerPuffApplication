package ch.zhaw.powerpuff.powerpuff.model.dto;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@RequiredArgsConstructor
@Getter
@Setter
public class UserActivateDTO {
    
    @NonNull
    private String userId;
    
}
