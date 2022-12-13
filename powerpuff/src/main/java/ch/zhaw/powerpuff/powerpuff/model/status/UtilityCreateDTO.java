package ch.zhaw.powerpuff.powerpuff.model.status;

import ch.zhaw.powerpuff.powerpuff.model.UtilityType;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Getter
public class UtilityCreateDTO {
    private String utilityName;
    private int unit;
    private UtilityType utilityType;
    
}
