package ch.zhaw.powerpuff.powerpuff.model.dto;

import com.mongodb.lang.NonNull;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

@NoArgsConstructor
@RequiredArgsConstructor
@Getter
public class UserCloseDTO {
    @NonNull
    private String userId;
    @NonNull
    private String comment;
}
