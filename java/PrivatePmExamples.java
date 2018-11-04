public class PrivatePmExamples {
	public static void main(String[] args) {
		PrivatePm pm = new PrivatePm();
		System.out.println(pm.output(pm.input("test")).message);
		System.out.println("https://privatepm.com/d#" + pm.input("test"));
	}
}
