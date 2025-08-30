use assert_cmd::prelude::*;
use predicates::prelude::*;
use std::process::Command;
use tempfile::Builder;
use std::fs;

const SAMPLE_SVG: &str = "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M12 2L2 22h20L12 2z\" fill=\"#000000\"></path></svg>";
const SAMPLE_SVG_FILENAME: &str = "test_icon.svg";

#[test]
fn test_mass_export_neumorphism() -> Result<(), Box<dyn std::error::Error>> {
    // 1. Set up temporary directories
    let temp_dir = Builder::new().prefix("cli-test-").tempdir()?;
    let source_dir = temp_dir.path().join("source");
    let output_dir = temp_dir.path().join("output");
    fs::create_dir_all(&source_dir)?;
    fs::create_dir_all(&output_dir)?;

    // 2. Create a sample source SVG file
    fs::write(source_dir.join(SAMPLE_SVG_FILENAME), SAMPLE_SVG)?;

    // 3. Run the CLI command
    let mut cmd = Command::cargo_bin("icon-cli")?;
    cmd.env("RUST_LOG", "info"); // Set log level for the test run
    cmd.arg("mass-export")
        .arg("--source")
        .arg(&source_dir)
        .arg("--output")
        .arg(&output_dir)
        .arg("--style")
        .arg("neumorphism")
        .arg("--color")
        .arg("#fafafa");

    // 4. Assert the command runs successfully
    cmd.assert()
        .success()
        .stderr(predicate::str::contains("Mass export complete!"));

    // 5. Verify the output file
    let expected_filename = format!("{}-{}.svg", "test_icon", "neumorphism");
    let output_file_path = output_dir.join(expected_filename);
    assert!(output_file_path.exists(), "Output file was not created");

    // 6. Verify the content of the output file
    let output_content = fs::read_to_string(output_file_path)?;

    // Check for key elements of the neumorphism style
    assert!(output_content.contains("<defs>"));
    assert!(output_content.contains("id=\"neumorphism-shadow\""));
    assert!(output_content.contains("filter=\"url(#neumorphism-shadow)\""));

    // Check for the icon path with the correct color
    assert!(output_content.contains("fill=\"#fafafa\""));
    assert!(output_content.contains("d=\"M12 2L2 22h20L12 2z\""));

    Ok(())
}
