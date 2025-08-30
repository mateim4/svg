use clap::Parser;
use icon_engine::{
    CustomStyles, StylePreset,
    gradient_parser::parse_gradient,
    generate_icon,
};
use rayon::prelude::*;
use std::fs;
use std::path::{Path, PathBuf};
use anyhow::{Context, Result};

#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
#[command(propagate_version = true)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Parser, Debug)]
enum Commands {
    /// Exports a directory of source icons to a new style.
    MassExport {
        /// Path to a folder containing the source Fluent UI SVG icons.
        #[arg(short, long, value_name = "PATH")]
        source: PathBuf,

        /// The directory where the generated icons will be saved.
        #[arg(short, long, value_name = "PATH")]
        output: PathBuf,

        /// The style preset to apply.
        #[arg(long)]
        style: StylePreset,

        /// An optional CSS gradient for the base.
        #[arg(long)]
        gradient: Option<String>,

        /// The color for the foreground icon in hex format (e.g., #RRGGBB).
        #[arg(long, default_value = "#333333")]
        color: String,

        /// The width of the final SVG canvas.
        #[arg(long, default_value_t = 128)]
        width: u32,

        /// The height of the final SVG canvas.
        #[arg(long, default_value_t = 128)]
        height: u32,

        /// The corner radius for the base shape.
        #[arg(long, default_value_t = 25.0)]
        corner_radius: f32,

        /// The padding between the icon and the edge of the base.
        #[arg(long, default_value_t = 16)]
        padding: u32,
    },
}

fn main() -> Result<()> {
    env_logger::init();
    let cli = Cli::parse();

    match cli.command {
        Commands::MassExport {
            source,
            output,
            style,
            gradient,
            color,
            width,
            height,
            corner_radius,
            padding,
        } => {
            // Validate source directory
            if !source.is_dir() {
                anyhow::bail!("Source path is not a valid directory: {}", source.display());
            }

            // Create output directory
            fs::create_dir_all(&output).context("Failed to create output directory")?;

            log::info!("Starting mass export from '{}' to '{}'", source.display(), output.display());

            let gradient = gradient.map(|s| parse_gradient(&s)).transpose()?;

            let styles = CustomStyles {
                width,
                height,
                corner_radius,
                padding,
                icon_color: color,
                gradient,
            };

            let entries: Vec<_> = fs::read_dir(&source)?
                .filter_map(Result::ok)
                .filter(|e| e.path().extension().map_or(false, |ext| ext == "svg"))
                .collect();

            log::info!("Found {} SVG files to process.", entries.len());

            entries.par_iter().for_each(|entry| {
                if let Err(e) = process_file(entry.path(), &output, style, &styles) {
                    log::error!("Failed to process file {}: {}", entry.path().display(), e);
                }
            });

            log::info!("Mass export complete!");
        }
    }

    Ok(())
}

fn process_file(
    source_path: PathBuf,
    output_dir: &Path,
    style: StylePreset,
    styles: &CustomStyles,
) -> Result<()> {
    let icon_data = fs::read_to_string(&source_path)
        .with_context(|| format!("Failed to read source SVG file: {}", source_path.display()))?;

    let generated_svg = generate_icon(&icon_data, style, styles)
        .with_context(|| format!("Failed to generate icon for {}", source_path.display()))?;

    let file_name = source_path.file_stem().unwrap_or_default().to_str().unwrap_or("icon");
    let style_str = format!("{:?}", style).to_lowercase();
    let output_filename = format!("{}-{}.svg", file_name, style_str);
    let output_path = output_dir.join(output_filename);

    fs::write(&output_path, generated_svg)
        .with_context(|| format!("Failed to write output SVG to {}", output_path.display()))?;

    log::info!("Successfully generated {}", output_path.display());

    Ok(())
}
