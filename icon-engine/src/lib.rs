pub mod svg_processor;
pub mod style_generator;
pub mod gradient_parser;

use thiserror::Error;

/// Public-facing error type for the icon generation process.
#[derive(Error, Debug)]
pub enum IconEngineError {
    #[error("Failed to parse source SVG data: {0}")]
    SvgParsingError(String),
    #[error("Invalid input provided: {0}")]
    InvalidInput(String),
    #[error("An unknown error has occurred")]
    Unknown,
}

/// Defines the visual style preset for the icon's base.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[cfg_attr(feature = "cli", derive(clap::ValueEnum))]
pub enum StylePreset {
    Neumorphism,
    Glassmorphism,
    FrostedGlass,
}

/// Represents a CSS linear gradient.
#[derive(Debug, Clone, PartialEq)]
pub struct Gradient {
    pub angle: u16,
    pub start_color: String,
    pub stop_color: String,
}

/// Defines all user-configurable properties for the generated icon.
#[derive(Debug, Clone)]
pub struct CustomStyles {
    pub width: u32,
    pub height: u32,
    pub corner_radius: f32,
    pub padding: u32,
    pub icon_color: String,
    pub gradient: Option<Gradient>,
}

impl Default for CustomStyles {
    fn default() -> Self {
        Self {
            width: 128,
            height: 128,
            corner_radius: 25.0,
            padding: 16,
            icon_color: "#333333".to_string(),
            gradient: None,
        }
    }
}

/// The main library function to generate an SVG icon.
pub fn generate_icon(
    icon_data: &str,
    style_preset: StylePreset,
    styles: &CustomStyles,
) -> Result<String, IconEngineError> {
    // 1. Parse and prepare the foreground icon
    let icon = svg_processor::parse_svg(icon_data)?;
    let transform = svg_processor::calculate_transform(icon.viewbox, styles);

    // 2. Generate the styled base and definitions as strings
    let (defs_str, base_rect_str) = style_generator::create_styled_base_str(styles, style_preset);

    // 3. Manually assemble the final SVG string
    let final_svg = format!(
        r#"<svg width="{width}" height="{height}" viewBox="0 0 {width} {height}" xmlns="http://www.w3.org/2000/svg">{defs}{base_rect}<g transform="{transform}"><path d="{path_data}" fill="{icon_color}"/></g></svg>"#,
        width = styles.width,
        height = styles.height,
        defs = defs_str,
        base_rect = base_rect_str,
        transform = transform,
        path_data = icon.path_data,
        icon_color = styles.icon_color
    );

    Ok(final_svg)
}

#[cfg(test)]
mod tests {
    use super::*;

    const TEST_SVG: &str = r#"<svg viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z"></path></svg>"#;

    #[test]
    fn test_neumorphism_style_generation() {
        let styles = CustomStyles::default();
        let result = generate_icon(TEST_SVG, StylePreset::Neumorphism, &styles);
        assert!(result.is_ok());
        let svg_output = result.unwrap();

        assert!(svg_output.contains("<defs>"));
        assert!(svg_output.contains("id=\"neumorphism-shadow\""));
        assert!(svg_output.contains("filter=\"url(#neumorphism-shadow)\""));
        assert!(svg_output.contains("fill=\"#333333\""));
        assert!(svg_output.contains("d=\"M12 2L2 22h20L12 2z\""));
    }

    #[test]
    fn test_glassmorphism_style_generation() {
        let styles = CustomStyles::default();
        let result = generate_icon(TEST_SVG, StylePreset::Glassmorphism, &styles);
        assert!(result.is_ok());
        let svg_output = result.unwrap();

        assert!(svg_output.contains("fill-opacity=\"0.2\""));
        assert!(svg_output.contains("stroke=\"rgba(255,255,255,0.3)\""));
    }

    #[test]
    fn test_gradient_generation() {
        let mut styles = CustomStyles::default();
        styles.gradient = Some(Gradient {
            angle: 90,
            start_color: "#ff0000".to_string(),
            stop_color: "#00ff00".to_string(),
        });

        let result = generate_icon(TEST_SVG, StylePreset::Neumorphism, &styles);
        assert!(result.is_ok());
        let svg_output = result.unwrap();

        assert!(svg_output.contains("<linearGradient id=\"base-gradient\""));
        assert!(svg_output.contains("stop-color=\"#ff0000\""));
        assert!(svg_output.contains("fill=\"url(#base-gradient)\""));
    }
}
