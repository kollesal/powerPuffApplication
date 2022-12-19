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
    
    public UtilityCreateDTO(String utilityName, int unit, UtilityType utilityType) {
        this.utilityName = utilityName;
        this.unit = unit;
        this.utilityType = utilityType;
    }

    public String utilityName(){
        return utilityName;
    }

    public int unit(){
        return unit;
    }

    public UtilityType utilityType(){
        return utilityType;
    }
    
}
