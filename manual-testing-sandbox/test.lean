example (a b c : Nat) : a + b + c = a + c + b := by
	rw [Nat.add_comm]
