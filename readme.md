# CSV Update Script

I recently started getting into the amateur/ham radio space. I downloaded a publicly available repeater list as a csv. While using my Icom ID-52, I loaded the list into my transceiver noticed that the callsigns were not displaying for some of those repeaters. I decided add the callsign manually, and received a "Duplicate Call Sign" message. 

I then observed the rest of the list and noticed that the .csv itself does indeed have multiple rows with the same callsigns. I'm assuming that the device treats the callsign as some sort of primary key, and therefore removes the callsign entirely. What this means is that repeater stations that use the same callsign in the list have a callsign listed. This is a bad user experience. This script aims to fix the list so that the callsigns appear. 

## Example inputs and output

| callsign  | frequency | 
| :-------- | :-------: | 
| MY0CS     | 000.000   | 
| MY0CS     | 000.100   | 
| UR0CS     | 000.300   | 
| OURCS     | 000.004   |

this would be updated to the following:

| callsign  | frequency | 
| :-------- | :-------: | 
| MY0CS/1   | 000.000   | 
| MY0CS/2   | 000.100   | 
| UR0CS     | 000.300   | 
| OURCS     | 000.004   |

### Limitations

Due to certain limitations, this does not account for the following, and are out of scope of for the purpose of this script:
* Since the maximum callsign length is 8 on the device, duplicate long callsigns that are long enough to cause the string to exceed the length will will still break. 
* rows in which the callsign is blank. The script will ignore any rows without a callsign. 

However, given these limitations, the chance of a blank callsign showing up are still relatively rare. What I've noticed personally is that my repeater list showing more callsigns on the duplicates where previously, repeaters showed blank callsigns. 


## Functionality

The script performs the following tasks:

* **Reads a CSV file:** It takes an input CSV file as a command-line argument.
* **Filters and updates rows:**
    * It processes rows where the "Mode" column has the value "FM".
    * It identifies rows with duplicate values in the "Repeater Call Sign" column.
    * For these duplicate entries, it appends "/1", "/2", etc., to the "Repeater Call Sign" value.
    * It ignores any callsigns with no data.
* **Writes to a new CSV file:** It outputs the updated data to a specified output CSV file.


## Installation

1.  **Clone the repository (or copy the script):**
    * If you cloned the repository, navigate to the project directory.
    * If you copied the script, save it as `update_csv.js`.
2.  **Install dependencies:**
    ```bash
    npm install csv-parser csv-writer
    ```

## Usage

Run the script from your terminal, providing the input and output CSV filenames as arguments:

```bash
node update_csv.js input.csv output.csv