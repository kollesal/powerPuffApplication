package ch.zhaw.powerpuff.powerpuff.model.dto;

import ch.zhaw.powerpuff.powerpuff.model.types.UtilityType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@RequiredArgsConstructor
@Getter
@Setter
public class UtilityCreateDTO {
    @NonNull
    private String utilityName;
    @NonNull
    private Integer unit;
    @NonNull
    private UtilityType utilityType;
    
}
