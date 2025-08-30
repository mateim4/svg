use crate::{CustomStyles, Gradient, StylePreset};

const NEUMORPHISM_FILTER_ID: &str = "neumorphism-shadow";
const GLASS_BLUR_FILTER_ID: &str = "glass-blur";
const GRADIENT_ID: &str = "base-gradient";

/// Creates the styled base as a tuple of strings: (definitions, base_shape).
pub fn create_styled_base_str(
    styles: &CustomStyles,
    preset: StylePreset,
) -> (String, String) {
    let mut defs = String::new();
    let mut rect_attrs = format!(
        r#"width="{}" height="{}" rx="{}" ry="{}""#,
        styles.width, styles.height, styles.corner_radius, styles.corner_radius
    );

    // Handle gradient fill
    if let Some(gradient) = &styles.gradient {
        defs.push_str(&create_gradient_def_str(gradient));
        rect_attrs.push_str(&format!(r#" fill="url(#{})""#, GRADIENT_ID));
    } else {
        let default_fill = if preset == StylePreset::Neumorphism {
            "#e0e0e0"
        } else {
            "white"
        };
        rect_attrs.push_str(&format!(r#" fill="{}""#, default_fill));
    }

    let (style_attrs, style_defs) = match preset {
        StylePreset::Neumorphism => create_neumorphism_style_str(styles),
        StylePreset::Glassmorphism | StylePreset::FrostedGlass => {
            create_glassmorphism_style_str(preset)
        }
    };

    rect_attrs.push_str(&style_attrs);
    if let Some(style_def_str) = style_defs {
        defs.push_str(&style_def_str);
    }

    let final_defs = if defs.is_empty() {
        String::new()
    } else {
        format!("<defs>{}</defs>", defs)
    };

    let rect = format!("<rect {}/>", rect_attrs);

    (final_defs, rect)
}

fn create_gradient_def_str(gradient: &Gradient) -> String {
    let angle_rad = (gradient.angle as f32 - 90.0).to_radians();
    let x1 = (50.0 - f32::cos(angle_rad) * 50.0);
    let y1 = (50.0 - f32::sin(angle_rad) * 50.0);
    let x2 = (50.0 + f32::cos(angle_rad) * 50.0);
    let y2 = (50.0 + f32::sin(angle_rad) * 50.0);

    format!(
        r#"<linearGradient id="{}" x1="{:.1}%" y1="{:.1}%" x2="{:.1}%" y2="{:.1}%"><stop offset="0%" stop-color="{}"/><stop offset="100%" stop-color="{}"/></linearGradient>"#,
        GRADIENT_ID, x1, y1, x2, y2, gradient.start_color, gradient.stop_color
    )
}

fn create_neumorphism_style_str(styles: &CustomStyles) -> (String, Option<String>) {
    let shadow_offset = styles.width as f32 / 25.0;
    let blur_radius = shadow_offset * 1.2;

    let filter_def = format!(
        r#"<filter id="{}"><feDropShadow dx="{}" dy="{}" stdDeviation="{}" flood-color="rgba(0,0,0,0.12)"/><feDropShadow dx="{}" dy="{}" stdDeviation="{}" flood-color="rgba(255,255,255,0.7)"/></filter>"#,
        NEUMORPHISM_FILTER_ID,
        shadow_offset, shadow_offset, blur_radius,
        -shadow_offset, -shadow_offset, blur_radius
    );

    let rect_attrs = format!(r#" filter="url(#{})""#, NEUMORPHISM_FILTER_ID);

    (rect_attrs, Some(filter_def))
}

fn create_glassmorphism_style_str(preset: StylePreset) -> (String, Option<String>) {
    let (blur_std_deviation, fill_opacity) = match preset {
        StylePreset::Glassmorphism => (5.0, 0.2),
        StylePreset::FrostedGlass => (12.0, 0.1),
        _ => (5.0, 0.2),
    };

    // Note: backdrop-filter is not a standard SVG attribute and might not work.
    // A simple opacity and stroke is more reliable.
    let rect_attrs = format!(
        r#" fill-opacity="{}" stroke="rgba(255,255,255,0.3)" stroke-width="1""#,
        fill_opacity
    );

    // We can still define the blur filter in defs, even if not widely supported.
    let filter_def = format!(
        r#"<filter id="{}"><feGaussianBlur stdDeviation="{}"/></filter>"#,
        GLASS_BLUR_FILTER_ID, blur_std_deviation
    );

    (rect_attrs, Some(filter_def))
}
