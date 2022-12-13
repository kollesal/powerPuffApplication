package ch.zhaw.powerpuff.powerpuff.model.status;

import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Getter
public class UserCloseDTO {
    private String userId;
    private String comment;
}
