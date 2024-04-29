const TABLE_NAME = 'child_keys';

class ChildKeys {
  constructor({
    id, is_child, derivation_path, master_seed_id, public_key, address, create_date, update_date,
  }) {
    this.id = id;
    this.is_child = is_child;
    this.derivation_path = derivation_path;
    this.master_seed_id = master_seed_id;
    this.public_key = public_key;
    this.address = address;
    this.create_date = create_date;
    this.update_date = update_date;
  }
}
module.exports = {
  TABLE_NAME,
  ChildKeys,
};
