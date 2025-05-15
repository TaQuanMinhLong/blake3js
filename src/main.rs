use blake::Hasher;
use std::io::Write;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut args = std::env::args().into_iter();
    if args.len() != 2 {
        eprintln!("Required arguments: [<input_file>, <tmp_file>]");
        std::process::exit(1);
    }
    let input = args.next().unwrap();
    let tmp = args.next().unwrap();
    let input_file = std::fs::File::options().read(true).open(input)?;
    let mut tmp_file = std::fs::File::options()
        .create(true)
        .write(true)
        .open(tmp)?;
    let mut hasher = Hasher::new();
    hasher.update_reader(input_file)?;
    let hash = hasher.finalize();
    tmp_file.write_all(hash.as_bytes())?;
    Ok(())
}
