package ch.zhaw.powerpuff.powerpuff.model.dto;

import com.mongodb.lang.NonNull;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@RequiredArgsConstructor
@Getter
@Setter
public class UserCloseDTO {
    
    @NonNull
    private String userId;
    @NonNull
    private String comment;
}
