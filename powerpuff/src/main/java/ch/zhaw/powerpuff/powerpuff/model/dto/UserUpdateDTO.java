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
public class UserUpdateDTO {

    @NonNull
    private String name;
    @NonNull
    private String username;
    @NonNull
    private String email;

    
}
