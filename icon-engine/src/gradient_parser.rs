use crate::{Gradient, IconEngineError};

/// Parses a simple `linear-gradient()` CSS string.
///
/// The expected format is `linear-gradient(angle, start-color, stop-color)`,
/// e.g., `"linear-gradient(45deg, #ff0000, #0000ff)"`.
pub fn parse_gradient(input: &str) -> Result<Gradient, IconEngineError> {
    let trimmed = input.trim();
    if !trimmed.starts_with("linear-gradient(") || !trimmed.ends_with(')') {
        return Err(IconEngineError::InvalidInput(
            "Gradient string must be in linear-gradient(...) format".to_string(),
        ));
    }

    // Extract content between parentheses
    let content = &trimmed["linear-gradient(".len()..trimmed.len() - 1];
    let parts: Vec<&str> = content.split(',').map(|s| s.trim()).collect();

    if parts.len() != 3 {
        return Err(IconEngineError::InvalidInput(
            "Gradient must have 3 parts: angle, start-color, stop-color".to_string(),
        ));
    }

    // Part 1: Angle
    let angle_str = parts[0];
    if !angle_str.ends_with("deg") {
        return Err(IconEngineError::InvalidInput(
            "Gradient angle must end with 'deg'".to_string(),
        ));
    }
    let angle = angle_str[..angle_str.len() - 3]
        .parse::<u16>()
        .map_err(|_| IconEngineError::InvalidInput(format!("Invalid angle value: {}", angle_str)))?;

    // Part 2 & 3: Colors
    let start_color = parts[1].to_string();
    let stop_color = parts[2].to_string();

    // Perform a basic sanity check on colors
    if !start_color.starts_with('#') || !stop_color.starts_with('#') {
         return Err(IconEngineError::InvalidInput(
            "Colors must be in hex format (e.g., #RRGGBB)".to_string(),
        ));
    }

    Ok(Gradient {
        angle,
        start_color,
        stop_color,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_valid_gradient_succeeds() {
        let grad_str = "linear-gradient(90deg, #ff0000, #00ff00)";
        let result = parse_gradient(grad_str).unwrap();
        assert_eq!(result.angle, 90);
        assert_eq!(result.start_color, "#ff0000");
        assert_eq!(result.stop_color, "#00ff00");
    }

    #[test]
    fn parse_valid_gradient_with_whitespace_succeeds() {
        let grad_str = "  linear-gradient( 45deg ,  #111111, #222222 )  ";
        let result = parse_gradient(grad_str).unwrap();
        assert_eq!(result.angle, 45);
        assert_eq!(result.start_color, "#111111");
        assert_eq!(result.stop_color, "#222222");
    }

    #[test]
    fn parse_invalid_prefix_fails() {
        assert!(parse_gradient("grad(45deg, #ff0000, #0000ff)").is_err());
    }

    #[test]
    fn parse_wrong_number_of_args_fails() {
        assert!(parse_gradient("linear-gradient(45deg, #ff0000)").is_err());
    }

    #[test]
    fn parse_missing_deg_fails() {
        assert!(parse_gradient("linear-gradient(45, #ff0000, #0000ff)").is_err());
    }

    #[test]
    fn parse_invalid_color_format_fails() {
         assert!(parse_gradient("linear-gradient(45deg, red, #0000ff)").is_err());
    }
}
