package ch.zhaw.powerpuff.powerpuff.model.dto;

import ch.zhaw.powerpuff.powerpuff.model.types.UtilityType;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Getter
public class UtilityCreateDTO {
    private String utilityName;
    private int unit;
    private UtilityType utilityType;
    
}
