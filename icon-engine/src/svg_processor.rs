use roxmltree::Document;
use crate::{CustomStyles, IconEngineError};

/// Represents the essential data extracted from a source SVG file.
#[derive(Debug)]
pub struct SvgIcon {
    pub path_data: String,
    pub viewbox: ViewBox,
}

/// Represents the dimensions of an SVG's viewBox.
#[derive(Debug, Copy, Clone)]
pub struct ViewBox {
    pub width: f32,
    pub height: f32,
}

/// Parses a string of SVG data to extract the icon path and viewBox.
///
/// It looks for the root `<svg>` element's `viewBox` and the `d` attribute
/// of the first `<path>` element it finds.
pub fn parse_svg(svg_data: &str) -> Result<SvgIcon, IconEngineError> {
    let doc = Document::parse(svg_data)
        .map_err(|e| IconEngineError::SvgParsingError(e.to_string()))?;

    let root_element = doc.root_element();
    if !root_element.has_tag_name("svg") {
        return Err(IconEngineError::SvgParsingError(
            "Root element is not <svg>".to_string(),
        ));
    }

    let viewbox_str = root_element.attribute("viewBox").ok_or_else(|| {
        IconEngineError::SvgParsingError("SVG does not have a viewBox attribute".to_string())
    })?;

    let viewbox_parts: Vec<f32> = viewbox_str
        .split_whitespace()
        .filter_map(|s| s.parse::<f32>().ok())
        .collect();

    if viewbox_parts.len() != 4 {
        return Err(IconEngineError::SvgParsingError(
            "viewBox attribute has invalid format. Expected 4 numbers.".to_string(),
        ));
    }
    // We only care about the width and height for scaling, not the min-x/min-y.
    let viewbox = ViewBox { width: viewbox_parts[2], height: viewbox_parts[3] };

    // Find the first <path> element and extract its 'd' attribute.
    let path_node = root_element
        .descendants()
        .find(|n| n.has_tag_name("path") && n.has_attribute("d"))
        .ok_or_else(|| {
            IconEngineError::SvgParsingError("No <path> element with a 'd' attribute found".to_string())
        })?;

    let path_data = path_node.attribute("d").unwrap().to_string();

    Ok(SvgIcon { path_data, viewbox })
}

/// Calculates the `transform` attribute value to scale and center the icon.
///
/// It preserves the icon's aspect ratio and fits it within the padded area
/// of the base defined by `CustomStyles`.
pub fn calculate_transform(viewbox: ViewBox, styles: &CustomStyles) -> String {
    let target_w = styles.width as f32 - (2.0 * styles.padding as f32);
    let target_h = styles.height as f32 - (2.0 * styles.padding as f32);

    if target_w <= 0.0 || target_h <= 0.0 {
        // Avoid division by zero or negative dimensions if padding is too large
        return "translate(0, 0) scale(0)".to_string();
    }

    let scale_x = target_w / viewbox.width;
    let scale_y = target_h / viewbox.height;
    let scale = scale_x.min(scale_y);

    let scaled_w = viewbox.width * scale;
    let scaled_h = viewbox.height * scale;

    let tx = styles.padding as f32 + (target_w - scaled_w) / 2.0;
    let ty = styles.padding as f32 + (target_h - scaled_h) / 2.0;

    format!("translate({}, {}) scale({})", tx, ty, scale)
}
